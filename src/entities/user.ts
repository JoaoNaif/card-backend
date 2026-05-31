import { Entity } from "../core/entities/entity"
import type { UniqueEntityId } from "../core/entities/unique-entity-id"
import type { Optional } from "../core/type/optional"

export interface UserProps {
    email: string
    name: string
    createdAt: Date
}

export class User extends Entity<UserProps> {
    get email() {
        return this.props.email
    }

    get name() {
        return this.props.name
    }

    get createdAt() {
        return this.props.createdAt
    }

    static create(
        props: Optional<UserProps, "createdAt">,
        id?: UniqueEntityId
    ) {
        const user = new User(
            {
                ...props,
                createdAt: props.createdAt ?? new Date(),
            },
            id
        )
        return user
    }

}