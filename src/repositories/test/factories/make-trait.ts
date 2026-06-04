import type { UniqueEntityId } from '../../../core/entities/unique-entity-id'
import { Trait, type TraitProps } from '../../../entities/trait'

export function makeTrait(
  override: Partial<TraitProps> = {},
  id?: UniqueEntityId
) {
  const trait = Trait.create(
    {
      name: 'Brave',
      description: 'A brave trait',
      ...override,
    },
    id
  )
  return trait
}
