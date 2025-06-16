import { describe, test, expect, beforeEach } from '@jest/globals';
import { RatingSystem, RatingZod } from '../src/utils/rating_system/skill_rating';

describe('Skill Rating System', () => {
  let ratingSystem: RatingSystem;
//   let defaultPlayers: Rating[];

  beforeEach(() => {
    ratingSystem = new RatingSystem();

    // defaultPlayers = [
    //   ratingSystem.new_rating(),
    //   ratingSystem.new_rating(),
    //   ratingSystem.new_rating(),
    //   ratingSystem.new_rating()
    // ];
  });
  
  test('should create RatingSystem with default parameters', () => {
    expect(ratingSystem.mu).toBe(25);
    expect(ratingSystem.sigma).toBeCloseTo(25/3);
    expect(ratingSystem.beta).toBeCloseTo(25/6);
    expect(ratingSystem.kappa).toBe(0.0001);
    expect(ratingSystem.margin).toBe(0);
  });

  test('should create RatingSystem with custom parameters', () => {
    const customSystem = new RatingSystem(30, 10, 5, 0.001, 1);
    expect(customSystem.mu).toBe(30);
    expect(customSystem.sigma).toBe(10);
    expect(customSystem.beta).toBe(5);
    expect(customSystem.kappa).toBe(0.001);
    expect(customSystem.margin).toBe(1);
  });

  test('should create new rating with default values', () => {
    const rating = ratingSystem.new_rating();
    expect(rating.mu).toBe(25);
    expect(rating.sigma).toBeCloseTo(25/3);
    
    // Validate with Zod schema
    expect(() => RatingZod.parse(rating)).not.toThrow();
  });
});