import z from "zod/v4";

export const RatingZod = z.object({
    mu: z.number(),
    sigma: z.number(),
})

export type Rating = z.infer<typeof RatingZod>;

type UpdatingVars = {
    total_skill_uncertainty: number;
    ties_count: number[];
    gamma: number;
}

export class RatingSystem{
    mu: number;
    sigma: number;
    beta: number;
    kappa: number;
    margin: number;

    constructor(mu: number = 25, sigma: number = 25/3, beta: number = 25 /6, kappa: number = 0.0001, margin: number = 0){
        this.mu = mu;
        this.sigma = sigma
        this.beta = beta
        this.kappa = kappa
        this.margin = margin
    }
    new_rating(mu: number | undefined = undefined, sigma: number | undefined = undefined): Rating{
        return {
            mu: mu !== undefined ? mu : this.mu,
            sigma: sigma !== undefined ? sigma : this.sigma
        }
    }

    get_all_players_with_equal_ranking(players: Rating[], player_to_match: Rating): Rating[]{
        return players.filter((player) => player.mu == player_to_match.mu)
    }

    get_all_players_with_lesser_ranking(players: Rating[], player_to_match: Rating): Rating[]{
        return players.filter((player) => player_to_match.mu >= player.mu)
    }

    update_player_rankings(players: Rating[], player_placings: number[]): Rating[]{
        const total_skill_uncertainty = players.map((player_rating) => player_rating.sigma ** 2 + this.beta ** 2).reduce((acc, value) => acc + value) ** 0.5
        var ties_map = new Map<number, number>();
        player_placings.forEach((placing) => {
            if (!ties_map.has(placing)){
                ties_map.set(placing, 0)
            }
            ties_map.set(placing, ties_map?.get(placing) as number + 1)
        })
        const ties_count = player_placings.map((placing) => ties_map?.get(placing) as number);

        const gamma = players.map((player_rating) => player_rating.sigma ** 2).reduce((acc, value) => acc + value) ** 0.5 / total_skill_uncertainty


        const updating_vars = {
            total_skill_uncertainty: total_skill_uncertainty,
            ties_count: ties_count,
            gamma: gamma
        }
        const new_rating = players.map((player, index) => ({
            mu: player.mu + this._calculate_omega(players, player_placings, index, updating_vars),
            sigma: ((player.sigma ** 2) * Math.max(1 - this._calculate_delta(players, player_placings, index, updating_vars), this.kappa)) ** 0.5
        }))
        return new_rating
    }

    _calculate_omega(players: Rating[], player_placings: number[], player_index: number, updating_vars: UpdatingVars): number{
        const player = players[player_index] as Rating

        const omega_normalisation_faction = (player.sigma ** 2) / updating_vars.total_skill_uncertainty;
        const omega = players.map((opponent, opponent_index) => {
            if (opponent_index === player_index) return 0;
            if (player_placings[player_index] as number < (player_placings[opponent_index] as number)) return 0;
        
            return - this._calculate_win_probability(player, opponent, updating_vars.total_skill_uncertainty) / (updating_vars.ties_count[opponent_index] as number)

        }).reduce((acc, value) => acc + value)
        return omega * omega_normalisation_faction;
    }

    _calculate_delta(players: Rating[], player_placings: number[], player_index: number, updating_vars: UpdatingVars): number{
        const player = players[player_index] as Rating

        const delta_normalisation_faction = (updating_vars.gamma * (player.sigma ** 2)) / (updating_vars.total_skill_uncertainty ** 2);
        const delta = players.map((opponent, opponent_index) => {
            if (opponent_index === player_index) return 0;
            if (player_placings[player_index] as number < (player_placings[opponent_index] as number)) return 0;

            const win_probability = this._calculate_win_probability(player, opponent, updating_vars.total_skill_uncertainty)

            return win_probability * (1 - win_probability) / (updating_vars.ties_count[opponent_index] as number)

        }).reduce((acc, value) => acc + value)
        return delta * delta_normalisation_faction;
    }


    _calculate_win_probability(player: Rating, opponent: Rating, total_skill_uncertainty: number): number {
        const player_rating = player.mu;
        const opponent_rating = opponent.mu;

        return (Math.E ** (player_rating / total_skill_uncertainty)) / (Math.E ** (opponent_rating / total_skill_uncertainty))
    }

}

export default RatingSystem;