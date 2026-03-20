import styled from '@emotion/styled';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Key } from 'ts-key-enum';
import { z } from 'zod';

import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { TextArea } from '@/ui/input/components/TextArea';
import { useLingui } from '@lingui/react/macro';
import { isValidHostname } from 'twenty-shared/utils';
import { Button } from 'twenty-ui/input';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(3)};
`;

const StyledLinkContainer = styled.div`
  display: flex;
  flex: 1;
  gap: ${({ theme }) => theme.spacing(2)};
`;

type SettingsAccountsBlocklistInputProps = {
  updateBlockedEmailList: ({
    handle,
    description,
  }: {
    handle: string;
    description: string;
  }) => void;
  blockedEmailOrDomainList: string[];
};

type FormInput = {
  emailOrDomain: string;
  description: string;
};

export const SettingsAccountsBlocklistInput = ({
  updateBlockedEmailList,
  blockedEmailOrDomainList,
}: SettingsAccountsBlocklistInputProps) => {
  const { t } = useLingui();

  const validationSchema = (blockedEmailOrDomainList: string[]) =>
    z
      .object({
        emailOrDomain: z
          .string()
          .trim()
          .pipe(z.email({ error: t`Invalid email or domain` }))
          .or(
            z.string().refine(
              (value) =>
                (value.startsWith('@') &&
                  isValidHostname(value.slice(1), {
                    allowIp: false,
                    allowLocalhost: false,
                  })) ||
                isValidHostname(value, {
                  allowIp: false,
                  allowLocalhost: false,
                }),
              t`Invalid email or domain`,
            ),
          )
          .refine(
            (value) => !blockedEmailOrDomainList.includes(value),
            t`Email or domain is already in blocklist`,
          ),
        description: z.string(),
      })
      .required();

  const { reset, handleSubmit, control, formState } = useForm<FormInput>({
    mode: 'onSubmit',
    resolver: zodResolver(validationSchema(blockedEmailOrDomainList)),
    defaultValues: {
      emailOrDomain: '',
      description: '',
    },
  });

  const submit = handleSubmit((data) => {
    updateBlockedEmailList({
      handle: data.emailOrDomain,
      description: data.description,
    });
  });

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === Key.Enter) {
      submit();
    }
  };

  const { isSubmitSuccessful } = formState;

  useEffect(() => {
    if (isSubmitSuccessful) {
      reset();
    }
  }, [isSubmitSuccessful, reset]);

  return (
    <form onSubmit={submit}>
      <StyledContainer>
        <StyledLinkContainer>
          <Controller
            name="emailOrDomain"
            control={control}
            render={({ field: { value, onChange }, fieldState: { error } }) => (
              <SettingsTextInput
                instanceId="settings-accounts-blocklist-input"
                placeholder={t`eddy@gmail.com, @apple.com`}
                value={value}
                onChange={onChange}
                error={error?.message}
                onKeyDown={handleKeyDown}
                fullWidth
              />
            )}
          />
          <Controller
            name="description"
            control={control}
            render={({ field: { value, onChange } }) => (
              <TextArea
                textAreaId="settings-accounts-blocklist-description"
                label={t`Description`}
                placeholder={t`Add context for this blocked sender or domain`}
                value={value}
                onChange={onChange}
                minRows={2}
              />
            )}
          />
        </StyledLinkContainer>
        <Button title={t`Add to blocklist`} type="submit" />
      </StyledContainer>
    </form>
  );
};
