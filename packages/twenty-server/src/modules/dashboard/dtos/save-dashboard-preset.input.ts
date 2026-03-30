import { Field, InputType } from '@nestjs/graphql';

import {
  IsNotEmpty,
  IsString,
  IsUUID,
  registerDecorator,
  type ValidationArguments,
  type ValidationOptions,
} from 'class-validator';
import GraphQLJSON from 'graphql-type-json';

const isNonEmptyFilterState = (value: unknown) => {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    Object.keys(value).length > 0
  );
};

const IsFilterStateRequired = (validationOptions?: ValidationOptions) => {
  return (object: object, propertyName: string) => {
    registerDecorator({
      name: 'isFilterStateRequired',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown) {
          return isNonEmptyFilterState(value);
        },
        defaultMessage(args?: ValidationArguments) {
          return `${args?.property ?? 'Filter state'} is required`;
        },
      },
    });
  };
};

@InputType()
export class SaveDashboardPresetInput {
  @Field(() => String)
  @IsUUID()
  dashboardId: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  name: string;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsFilterStateRequired({ message: 'Filter state is required' })
  filterState: Record<string, unknown> | null;
}

export class CreateDashboardPresetBody {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsFilterStateRequired({ message: 'Filter state is required' })
  filterState: Record<string, unknown> | null;
}
