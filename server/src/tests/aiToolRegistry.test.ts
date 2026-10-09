import { AI_TOOLS } from '../services/aiToolRegistry.js';

describe('AI Tool Registry & Safety Gating', () => {
  it('registers required marketplace discovery tools without confirmation gate', () => {
    expect(AI_TOOLS.searchListings).toBeDefined();
    expect(AI_TOOLS.searchListings.requiresConfirmation).toBe(false);

    expect(AI_TOOLS.getListingDetails).toBeDefined();
    expect(AI_TOOLS.getListingDetails.requiresConfirmation).toBe(false);

    expect(AI_TOOLS.checkAvailability).toBeDefined();
    expect(AI_TOOLS.checkAvailability.requiresConfirmation).toBe(false);

    expect(AI_TOOLS.calculateRentalPrice).toBeDefined();
    expect(AI_TOOLS.calculateRentalPrice.requiresConfirmation).toBe(false);
  });

  it('marks consequential operations as requiring explicit confirmation', () => {
    expect(AI_TOOLS.createBookingRequest).toBeDefined();
    expect(AI_TOOLS.createBookingRequest.requiresConfirmation).toBe(true);

    expect(AI_TOOLS.cancelEligibleBooking).toBeDefined();
    expect(AI_TOOLS.cancelEligibleBooking.requiresConfirmation).toBe(true);

    expect(AI_TOOLS.submitListingForApproval).toBeDefined();
    expect(AI_TOOLS.submitListingForApproval.requiresConfirmation).toBe(true);

    expect(AI_TOOLS.respondToBookingRequest).toBeDefined();
    expect(AI_TOOLS.respondToBookingRequest.requiresConfirmation).toBe(true);
  });

  it('generates high quality listing descriptions through generateListingDescription tool', async () => {
    const result = await AI_TOOLS.generateListingDescription.execute(
      { itemName: 'Sony FX3 Cinema Camera', features: 'Full-frame 4K 120p, XLR Handle Unit', condition: 'Brand New' },
      {}
    );

    expect(result.suggestedTitle).toContain('Sony FX3 Cinema Camera');
    expect(result.suggestedDescription).toContain('Sony FX3 Cinema Camera');
    expect(result.suggestedRules.length).toBeGreaterThan(0);
  });
});
