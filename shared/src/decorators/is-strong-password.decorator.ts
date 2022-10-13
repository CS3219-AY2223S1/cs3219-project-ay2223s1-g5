import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from "class-validator";

import isStrongPassword from "validator/lib/isStrongPassword";

export const IsStrongPassword = (validationOptions?: ValidationOptions) => {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return (object: Object, propertyName: string) => {
    registerDecorator({
      name: "isStrongPassword",
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate: (value: unknown): boolean => {
          if (typeof value !== "string") {
            return false;
          }
          return isStrongPassword(value);
        },
        defaultMessage: (validationArguments?: ValidationArguments): string =>
          `${validationArguments?.property} must contain an uppercase character, ` +
          `lowercase character, number, symbol, and be at least 8 characters long`,
      },
    });
  };
};
