import React from 'react';
import { translate as __ } from 'foremanReact/common/I18n';
import { Label } from '@patternfly/react-core';

export const STATUS = {
  PENDING: 'PENDING',
  RESOLVED: 'RESOLVED',
  ERROR: 'ERROR',
};

export const PER_PAGE_OPTIONS = [
  { title: '5', value: 5 },
  { title: '10', value: 10 },
  { title: '20', value: 20 },
  { title: '50', value: 50 },
];

export const columns = {
  title: {
    title: __('Title'),
    wrapper: () => null,
  },
  host: {
    title: __('Host'),
    wrapper: () => null,
  },
  risk_factor: {
    title: __('Risk Factor'),
    wrapper: () => null,
  },
  has_remediation: {
    title: __('Has Remediation?'),
    wrapper: () => null,
  },
  inhibitor: {
    title: __('Inhibitor?'),
    wrapper: () => null,
  },
};

export const renderSeverityLabel = severity => {
  switch (severity) {
    case 'high':
      return <Label color="red">{__('High')}</Label>;
    case 'medium':
      return <Label color="orange">{__('Medium')}</Label>;
    case 'low':
      return <Label color="blue">{__('Low')}</Label>;
    case 'info':
      return <Label color="grey">{__('Info')}</Label>;
    default:
      return <Label color="grey">{severity || __('Info')}</Label>;
  }
};
