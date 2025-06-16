export type PlayerGameStats = {
    player_id: string,
    average_points: number,
    average_placement: number,
    games_played: number
};

export type PlayerStats = PlayerGameStats & {
    displayed_rating: number
};

export default PlayerStats;