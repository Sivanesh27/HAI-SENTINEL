import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RiskBadge, ConfidenceBadge, PriorityBadge } from '../components/RiskBadge';

describe('Clinical Risk Badges', () => {
  it('renders CRITICAL risk badge with correct label and colors', () => {
    const { container } = render(<RiskBadge category="CRITICAL" size="md" />);
    expect(screen.getByText('CRITICAL')).toBeDefined();
    expect(container.innerHTML).toContain('rose');
  });

  it('renders HIGH, MODERATE, and LOW risk badges', () => {
    render(<RiskBadge category="HIGH" size="sm" />);
    expect(screen.getByText('HIGH')).toBeDefined();

    render(<RiskBadge category="MODERATE" size="sm" />);
    expect(screen.getByText('MODERATE')).toBeDefined();

    render(<RiskBadge category="LOW" size="sm" />);
    expect(screen.getByText('LOW')).toBeDefined();
  });

  it('renders Confidence Badge levels', () => {
    render(<ConfidenceBadge level="HIGH" />);
    expect(screen.getByText('HIGH')).toBeDefined();
    expect(screen.getByText('Confidence:')).toBeDefined();
  });

  it('renders Priority Badges correctly for IPC rounding', () => {
    render(<PriorityBadge priority={1} />);
    expect(screen.getByText('PRIORITY 1 • IMMEDIATE')).toBeDefined();

    render(<PriorityBadge priority={2} />);
    expect(screen.getByText('PRIORITY 2 • ELEVATED')).toBeDefined();

    render(<PriorityBadge priority={3} />);
    expect(screen.getByText('PRIORITY 3 • ROUTINE')).toBeDefined();
  });
});
