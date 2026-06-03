import { Entity } from '../core/entities/entity'
import type { UniqueEntityId } from '../core/entities/unique-entity-id'
import type { Optional } from '../core/type/optional'

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
}
export interface UserProps {
  email: string
  name: string
  passwordHash: string
  userRole: UserRole
  createdAt: Date
}

export class User extends Entity<UserProps> {
  get email() {
    return this.props.email
  }

  get name() {
    return this.props.name
  }

  get passwordHash() {
    return this.props.passwordHash
  }

  get createdAt() {
    return this.props.createdAt
  }

  isAdmin() {
    return this.props.userRole === UserRole.ADMIN
  }

  static create(
    props: Optional<UserProps, 'createdAt' | 'userRole'>,
    id?: UniqueEntityId
  ) {
    const user = new User(
      {
        ...props,
        userRole: props.userRole ?? UserRole.USER,
        createdAt: props.createdAt ?? new Date(),
      },
      id
    )
    return user
  }
}
