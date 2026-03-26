import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Home from './pages/Home';

// Mock fetch to prevent network calls in tests
globalThis.fetch = vi.fn().mockImplementation(() =>
    Promise.resolve({
        json: () => Promise.resolve([]),
    })
);

describe('Application Pages Load Correctly', () => {
    it('renders Home page without crashing', () => {
        // Check if the Home page renders its primary heading
        render(
            <BrowserRouter>
                <Home />
            </BrowserRouter>
        );
        expect(screen.getByText(/Find your Arc/i)).toBeInTheDocument();
    });
});
