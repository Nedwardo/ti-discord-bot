import { User } from "discord.js";
export type GamePlayerStored = {
    game_id: number;
    player: string;
    faction: string;
    T0_speaker_order: number;
    ranking: number;
    points: number;
}

type PlayerGameData = {
    player: User;
    faction: string;
    T0_speaker_order: number;
    ranking: number;
    points: number;
}


export default PlayerGameData;