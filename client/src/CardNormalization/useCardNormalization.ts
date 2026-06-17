import { useCallback, useMemo, useState } from 'react';
import type { PsgAssetRef } from '@promptscape/core/services/psg';
import {
  readNormalization,
  recomputeDerived,
  type CardNormalization,
  type NormalizationStatus,
  type PoseClass
} from '@promptscape/core/services/cardNormalization';
import { SEED_CARDS, type SeedCard } from './seedAssets';
import {
  CARD_IMAGE_WIDTH,
  CARD_IMAGE_HEIGHT,
  FIGURE_HEAD_TOP,
  FIGURE_HEAD_UNIT
} from './figures';
import { applyArchetype, finalize, heuristicSolve } from './geometry';

/** Generic starting normalization for an imported image — user calibrates from here. */
function importNormalization(assetId: string): CardNormalization {
  const groundY = CARD_IMAGE_HEIGHT * 0.92;
  return recomputeDerived({
    version: 'card-norm/1',
    assetId,
    imageWidth: CARD_IMAGE_WIDTH,
    imageHeight: CARD_IMAGE_HEIGHT,
    head: {
      centerX: CARD_IMAGE_WIDTH / 2,
      centerY: FIGURE_HEAD_TOP + FIGURE_HEAD_UNIT / 2,
      width: 72,
      height: FIGURE_HEAD_UNIT,
      rotation: 0,
      mode: 'visual-oval',
      includesHeadwear: true,
      confidence: 0.5
    },
    ground: {
      y: groundY,
      angle: 0,
      leftContact: { x: 232, y: groundY },
      rightContact: { x: 280, y: groundY },
      supportWidth: 48,
      confidence: 0.5
    },
    pivot: { x: CARD_IMAGE_WIDTH / 2, y: groundY, uv: { u: 0.5, v: 0.92 }, lockToGround: true },
    crop: { x: 0, y: 0, width: CARD_IMAGE_WIDTH, height: CARD_IMAGE_HEIGHT, padding: { top: 0, right: 0, bottom: 0, left: 0 } },
    observedHeadCount: 0,
    canonicalHeadCount: 7.5,
    archetype: 'adult-male-racegoer',
    poseClass: 'standing-relaxed',
    targetHeightM: 1.75,
    confidence: { mask: 0.5, pose: 0.5, head: 0.5, ground: 0.5, overall: 0.5 },
    status: 'unsolved',
    updatedAt: new Date().toISOString()
  });
}

const STORE_KEY = 'psg:card-norm-records-v2';

type RecordMap = Record<string, CardNormalization>;

function loadRecords(cards: SeedCard[]): RecordMap {
  let persisted: RecordMap = {};
  try {
    const raw = window.localStorage.getItem(STORE_KEY);
    if (raw) {
      persisted = JSON.parse(raw) as RecordMap;
    }
  } catch {
    persisted = {};
  }
  const out: RecordMap = {};
  cards.forEach(({ asset }) => {
    const seed = readNormalization(asset);
    out[asset.id] = persisted[asset.id] ?? (seed as CardNormalization);
  });
  return out;
}

function persist(records: RecordMap) {
  try {
    window.localStorage.setItem(STORE_KEY, JSON.stringify(records));
  } catch {
    /* ignore quota / privacy errors */
  }
}

const clone = (n: CardNormalization): CardNormalization =>
  JSON.parse(JSON.stringify(n));

export function useCardNormalization() {
  const [cards, setCards] = useState<SeedCard[]>(SEED_CARDS);
  const [records, setRecords] = useState<RecordMap>(() => loadRecords(SEED_CARDS));
  const [index, setIndex] = useState(0);
  const [working, setWorking] = useState<CardNormalization>(() =>
    clone(loadRecords(cards)[cards[0].asset.id])
  );
  const [dirty, setDirty] = useState(false);

  const card = cards[index];

  const change = useCallback((next: CardNormalization) => {
    setWorking(finalize(next));
    setDirty(true);
  }, []);

  const setArchetype = useCallback((archetypeId: string) => {
    setWorking(prev => applyArchetype(prev, archetypeId));
    setDirty(true);
  }, []);

  const setPoseClass = useCallback((poseClass: PoseClass) => {
    setWorking(prev => ({ ...prev, poseClass }));
    setDirty(true);
  }, []);

  const autoSolve = useCallback(() => {
    setWorking(prev => heuristicSolve(prev));
    setDirty(true);
  }, []);

  const reset = useCallback(() => {
    setWorking(clone(records[card.asset.id]));
    setDirty(false);
  }, [records, card.asset.id]);

  const save = useCallback(
    (approve: boolean) => {
      const status: NormalizationStatus = approve ? 'approved' : 'edited';
      const saved: CardNormalization = {
        ...working,
        status,
        updatedAt: new Date().toISOString()
      };
      setRecords(prev => {
        const next = { ...prev, [saved.assetId]: saved };
        persist(next);
        return next;
      });
      setWorking(saved);
      setDirty(false);
    },
    [working]
  );

  const importImage = useCallback(
    (dataUrl: string) => {
      const id = `import-${new Date().getTime()}`;
      const norm = importNormalization(id);
      const asset: PsgAssetRef = {
        id,
        kind: 'render-output',
        role: 'crowd-card',
        storage: { provider: 'local', uri: dataUrl },
        provenance: { source: 'upload' },
        metadata: {}
      };
      const card: SeedCard = { asset, paletteIndex: 0, heads: 7.5, imageUri: dataUrl };
      setRecords(prev => ({ ...prev, [id]: norm }));
      setCards(prev => [...prev, card]);
      setIndex(cards.length);
      setWorking(clone(norm));
      setDirty(false);
    },
    [cards.length]
  );

  const goTo = useCallback(
    (nextIndex: number) => {
      if (nextIndex < 0 || nextIndex >= cards.length) {
        return;
      }
      // Non-jarring: silently persist unsaved edits instead of a blocking warning.
      if (dirty) {
        const saved: CardNormalization = {
          ...working,
          updatedAt: new Date().toISOString()
        };
        setRecords(prev => {
          const next = { ...prev, [saved.assetId]: saved };
          persist(next);
          return next;
        });
      }
      setIndex(nextIndex);
      setWorking(clone(records[cards[nextIndex].asset.id]));
      setDirty(false);
    },
    [cards, dirty, records, working]
  );

  const next = useCallback(() => goTo(index + 1), [goTo, index]);
  const prev = useCallback(() => goTo(index - 1), [goTo, index]);

  const statuses = useMemo(
    () =>
      cards.map(c => records[c.asset.id]?.status ?? 'unsolved'),
    [cards, records]
  );

  return {
    cards,
    index,
    card,
    working,
    dirty,
    statuses,
    change,
    setArchetype,
    setPoseClass,
    autoSolve,
    reset,
    save,
    goTo,
    next,
    prev,
    importImage
  };
}
