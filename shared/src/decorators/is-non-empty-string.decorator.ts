import {
  isNotEmpty,
  isString,
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from "class-validator";

export const IsNonEmptyString = (validationOptions?: ValidationOptions) => {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return (object: Object, propertyName: string) => {
    registerDecorator({
      name: "isNonEmptyString",
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate: (value: unknown): boolean =>
          isString(value) && isNotEmpty(value.trim()),
        defaultMessage: (validationArguments?: ValidationArguments): string =>
          `${validationArguments?.property} must be a non-empty string`,
      },
    });
  };
};
