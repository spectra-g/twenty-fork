import React from 'react';

export type JSONContent = {
  type?: string;
  text?: string;
  content?: JSONContent[];
};

const buildTemplateElement = (
  templateName: string,
  props: Record<string, unknown>,
) => {
  return React.createElement('div', {
    'data-template': templateName,
    'data-props': JSON.stringify(props),
  });
};

const renderNode = (node: JSONContent | undefined, key: string): unknown => {
  if (!node) {
    return null;
  }

  if (node.type === 'text') {
    return node.text ?? '';
  }

  if (node.type === 'hardBreak') {
    return React.createElement('br', { key });
  }

  const children = (node.content ?? []).map((child, index) =>
    renderNode(child, `${key}-${index}`),
  );

  if (node.type === 'paragraph') {
    return React.createElement('p', { key }, ...children);
  }

  return React.createElement('div', { key }, ...children);
};

export const reactMarkupFromJSON = (json: JSONContent | string) => {
  if (typeof json === 'string') {
    return json;
  }

  const children = (json.content ?? []).map((node, index) =>
    renderNode(node, `root-${index}`),
  );

  return React.createElement(
    'html',
    null,
    React.createElement('head', null),
    React.createElement('body', null, ...children),
  );
};

export const PasswordResetLinkEmail = (props: Record<string, unknown>) =>
  buildTemplateElement('PasswordResetLinkEmail', props);

export const PasswordUpdateNotifyEmail = (props: Record<string, unknown>) =>
  buildTemplateElement('PasswordUpdateNotifyEmail', props);

export const SendEmailVerificationLinkEmail = (
  props: Record<string, unknown>,
) => buildTemplateElement('SendEmailVerificationLinkEmail', props);

export const SendInviteLinkEmail = (props: Record<string, unknown>) =>
  buildTemplateElement('SendInviteLinkEmail', props);

export const SendApprovedAccessDomainValidation = (
  props: Record<string, unknown>,
) => buildTemplateElement('SendApprovedAccessDomainValidation', props);

export const CleanSuspendedWorkspaceEmail = (props: Record<string, unknown>) =>
  buildTemplateElement('CleanSuspendedWorkspaceEmail', props);

export const WarnSuspendedWorkspaceEmail = (props: Record<string, unknown>) =>
  buildTemplateElement('WarnSuspendedWorkspaceEmail', props);
