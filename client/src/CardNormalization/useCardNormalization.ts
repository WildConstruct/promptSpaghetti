import { useCallback, useMemo, useState } from 'react';
import {
  readNormalization,
  type CardNormalization,
  type NormalizationStatus,
  type PoseClass
} from '@promptscape/core/services/cardNormalization';
import { SEED_CARDS, type SeedCard } from './seedAssets';
import { applyArchetype, finalize, heuristicSolve } from './geometry';

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
  const cards = SEED_CARDS;
  const [records, setRecords] = useState<RecordMap>(() => loadRecords(cards));
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

  const goTo = useCallback(
    (nextIndex: number) => {
      if (nextIndex < 0 || nextIndex >= cards.length) {
        return;
      }
      if (
        dirty &&
        !window.confirm('Discard unsaved changes to this card?')
      ) {
        return;
      }
      setIndex(nextIndex);
      setWorking(clone(records[cards[nextIndex].asset.id]));
      setDirty(false);
    },
    [cards, dirty, records]
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
    prev
  };
}
