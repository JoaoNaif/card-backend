import type { UseCaseError } from "../use-case-error";

export class ResourceAlreadyExistError extends Error implements UseCaseError {
  constructor(name: string) {
    super(`${name} already exists`)
  }
}