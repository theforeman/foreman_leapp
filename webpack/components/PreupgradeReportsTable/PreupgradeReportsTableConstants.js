import React from 'react';
import { translate as __ } from 'foremanReact/common/I18n';
import { Label } from '@patternfly/react-core';

export const STATUS = {
  PENDING: 'PENDING',
  RESOLVED: 'RESOLVED',
  ERROR: 'ERROR',
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
