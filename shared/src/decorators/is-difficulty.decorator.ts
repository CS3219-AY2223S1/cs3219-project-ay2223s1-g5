import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from "class-validator";

import { Difficulty } from "../types/base";

export const IsDifficulty = (validationOptions?: ValidationOptions) => {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return (object: Object, propertyName: string) => {
    registerDecorator({
      name: "isDifficulty",
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate: (value: unknown): boolean => {
          if (typeof value !== "string") {
            return false;
          }
          for (const val of Object.values(Difficulty)) {
            if (value === val) {
              return true;
            }
          }
          return false;
        },
        defaultMessage: (validationArguments?: ValidationArguments): string =>
          `${validationArguments?.property} must be a valid difficulty`,
      },
    });
  };
};
