import type { Character, Power, Skill, User } from "../../../generated/prisma";


export interface dtoFetchCharacter {
    character: Character,
    power: Power,
    user: User,
}