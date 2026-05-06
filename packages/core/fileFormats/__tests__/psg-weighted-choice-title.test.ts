import { convertPSGToPSGLib, exportGraphToPSG, parsePSG } from '../psg';

describe('WeightedChoice PSG title round-trip', () => {
  it('exports the editor label as the PSG node name', () => {
    const psg = exportGraphToPSG(
      [
        {
          id: 'choice-age',
          type: 'weightedChoice',
          position: { x: 100, y: 200 },
          data: {
            nodeType: 'weightedChoice',
            label: 'Age',
            title: 'Age',
            options: [
              { id: 'option-1', text: 'young', weight: 1, hasBranch: false },
              { id: 'option-2', text: 'old', weight: 1, hasBranch: false }
            ]
          }
        }
      ],
      []
    );

    expect(psg.nodes[0]).toMatchObject({
      id: 'choice-age',
      type: 'WeightedChoice',
      name: 'Age'
    });
    expect(psg.nodes[0].data).toBeUndefined();
  });

  it('imports the PSG node name as the editor label', () => {
    const psg = parsePSG(
      JSON.stringify({
        version: '1.0.0',
        name: 'Demographics',
        nodes: [
          {
            id: 'choice-sex',
            type: 'WeightedChoice',
            name: 'Sex',
            x: 100,
            y: 200,
            options: [
              { text: 'female', weight: 1 },
              { text: 'male', weight: 1 }
            ]
          }
        ],
        edges: []
      })
    );

    const psglib = convertPSGToPSGLib(psg);
    const importedNode = psglib.graph.nodes.find(
      (node: any) => node.id === 'choice-sex'
    );

    expect(importedNode).toMatchObject({
      type: 'weightedChoice',
      data: {
        label: 'Sex',
        nodeType: 'weightedChoice'
      }
    });
  });
});
