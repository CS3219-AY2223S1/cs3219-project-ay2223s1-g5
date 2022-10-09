import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from "class-validator";

import { Language } from "../types/base";

export const IsLanguage = (validationOptions?: ValidationOptions) => {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return (object: Object, propertyName: string) => {
    registerDecorator({
      name: "isLanguage",
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate: (value: unknown): boolean => {
          if (typeof value !== "string") {
            return false;
          }
          for (const val of Object.values(Language)) {
            if (value === val) {
              return true;
            }
          }
          return false;
        },
        defaultMessage: (validationArguments?: ValidationArguments): string =>
          `${validationArguments?.property} must be a valid language`,
      },
    });
  };
};
