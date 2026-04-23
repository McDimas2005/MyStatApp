import { buildWidgetPayload } from '../src/utils/widgetPayload';

describe('buildWidgetPayload', () => {
  test('returns formatted totals and average values', () => {
    const payload = buildWidgetPayload({
      cores: [
        { id: '1', name: 'Health', color: '#ff0000', totalScore: 1250 },
        { id: '2', name: 'Social', color: '#00ff00', totalScore: 750 },
      ],
      averageScoreTarget: 1000,
      compactNumbers: true,
    });

    expect(payload.totalScore).toBe(2000);
    expect(payload.averageScore).toBe(1000);
    expect(payload.totalScoreLabel).toBe('2K');
    expect(payload.averageScoreLabel).toBe('1K');
    expect(payload.targetLabel).toBe('1K');
    expect(payload.cores).toHaveLength(2);
    expect(payload.cores[0].label).toBe('HEA');
  });

  test('limits widget cores to the top six by score when too many exist', () => {
    const payload = buildWidgetPayload({
      cores: [
        { id: '1', name: 'One', totalScore: 10 },
        { id: '2', name: 'Two', totalScore: 20 },
        { id: '3', name: 'Three', totalScore: 30 },
        { id: '4', name: 'Four', totalScore: 40 },
        { id: '5', name: 'Five', totalScore: 50 },
        { id: '6', name: 'Six', totalScore: 60 },
        { id: '7', name: 'Seven', totalScore: 70 },
      ],
      averageScoreTarget: 100,
      compactNumbers: false,
    });

    expect(payload.cores).toHaveLength(6);
    expect(payload.cores[0].name).toBe('Seven');
    expect(payload.cores[payload.cores.length - 1].name).toBe('Two');
  });
});
