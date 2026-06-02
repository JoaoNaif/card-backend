import { left, right, type Either } from '../../core/either'
import { ResourceNotFoundError } from '../../core/error/err/not-found-error'
import type { Encrypter } from '../../repositories/cryptography/core/encrypter'
import type { HashCompare } from '../../repositories/cryptography/core/hash-compare'
import type { IUserRepository } from '../../repositories/interface/user-repository'
import { WrongCredentialsError } from './err/wrong-credentials-error'

interface AuthenticateUserRequest {
  email: string
  password: string
}

type AuthenticateUserResponse = Either<
  WrongCredentialsError | ResourceNotFoundError,
  {
    accessToken: string
  }
>

export class AuthenticateUserUseCase {
  constructor(
    private userRepository: IUserRepository,
    private hashCompare: HashCompare,
    private encrypter: Encrypter
  ) {}

  async execute({
    email,
    password,
  }: AuthenticateUserRequest): Promise<AuthenticateUserResponse> {
    const user = await this.userRepository.findByEmail(email)

    if (!user) {
      return left(new ResourceNotFoundError('User'))
    }

    const isPasswordValid = await this.hashCompare.compare(
      password,
      user.passwordHash
    )

    if (!isPasswordValid) {
      return left(new WrongCredentialsError())
    }

    const accessToken = await this.encrypter.encrypt({
      sub: user.id.toString(),
    })

    return right({
      accessToken,
    })
  }
}
