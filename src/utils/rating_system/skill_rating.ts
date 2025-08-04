export type Rating = {
    mu: number;
    sigma: number;
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
        /***/
        // const total_skill_uncertainty = players.map((player_rating) => player_rating.sigma ** 2 + this.beta ** 2).reduce((acc, value) => acc + value) ** 0.5

        const updated_players = players.map((player, player_index) => {
            const opponent_values = players.map((opponent, opponent_index) => {
                if (player_index === opponent_index) return {
                    sigma: 0,
                    eta: 0
                };

                const skill_uncertainty = Math.sqrt(player.sigma ** 2 + opponent.sigma ** 2 + 2*(this.beta**2));
                const probability_of_winning = this._normalise_rating(player.mu, skill_uncertainty) / (this._normalise_rating(player.mu, skill_uncertainty) + this._normalise_rating(opponent.mu, skill_uncertainty))
                const score =  player_placings[player_index] as number < (player_placings[opponent_index] as number) ? 1 : 0
                const gamma = player.sigma / skill_uncertainty

                return {
                    sigma: (((player.sigma ** 2) / skill_uncertainty) * (score - probability_of_winning)),
                    eta: (gamma * ((player.sigma / skill_uncertainty) ** 2) * probability_of_winning * (1 - probability_of_winning))
                }
            }).reduce((acc, value) => ({
                sigma: acc.sigma + value.sigma,
                eta: acc.eta + value.eta
            }))
            return {
                mu: player.mu + opponent_values.sigma,
                sigma: Math.sqrt((player.sigma ** 2) * Math.max(1 - opponent_values.eta, this.kappa))
            }
        })
        return updated_players
    }

    _normalise_rating(skill_value: number, uncertainty: number): number {
        return Math.E ** (skill_value / uncertainty);
    }

}

export function display_rating(rating: Rating): number{
    return 50 + (rating.mu - 3 * rating.sigma);
}

export default RatingSystem;