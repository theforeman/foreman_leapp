import React from 'react';
import { Grid, ListView, Badge, Icon } from 'patternfly-react';
import { translate as __ } from 'foremanReact/common/I18n';

import EmptyInfoItem from './EmptyInfoItem';
import SeverityHigh from './images/i_severity-high.svg';
import SeverityMedium from './images/i_severity-med.svg';
import SeverityLow from './images/i_severity-low.svg';

export const itemIteratorId = (entry, ...rest) =>
  `${entry.id}-${entry.preupgradeReportId}-${rest.join('-')}`;

export const tagInfo = tags =>
  tags.map(attr => (
    <Badge key={attr} variant="pill primary">
      {attr}
    </Badge>
  ));

export const getSeverityImg = entry => {
  const key = itemIteratorId(entry, `sv${entry.id}`);

  switch (entry.severity) {
    case 'low':
      return (
        <img
          key={key}
          src={SeverityLow}
          alt={__('Low Risk Factor')}
          className="severity-img"
        />
      );
    case 'medium':
      return (
        <img
          key={key}
          src={SeverityMedium}
          alt={__('Medium Risk Factor')}
          className="severity-img"
        />
      );
    case 'high':
      return (
        <img
          key={key}
          src={SeverityHigh}
          alt={__('High Risk Factor')}
          className="severity-img"
        />
      );
    default:
      return (
        <img
          key={key}
          src={SeverityLow}
          alt={__('Low Risk Factor')}
          className="severity-img"
        />
      );
  }
};

export const hasRemediations = entry => {
  const key = itemIteratorId(entry, `rm${entry.id}`);
  if (entry.detail && entry.detail.remediations) {
    return (
      <ListView.InfoItem key={key}>
        <Icon type="pf" name="warning-triangle-o" /> {__('Has Remediation')}
      </ListView.InfoItem>
    );
  }

  return <EmptyInfoItem key={key} entry={entry} attr="remediation" />;
};

export const getTitle = entry => {
  if (entry.title) {
    return (
      <Grid.Row>
        <Grid.Col md={1}>
          <strong>{__('Title')}</strong>
        </Grid.Col>
        <Grid.Col md={8}>{entry.title}</Grid.Col>
      </Grid.Row>
    );
  }
  return <div />;
};

export const getSeverity = entry => {
  if (entry.severity) {
    return (
      <Grid.Row className="top-padded">
        <Grid.Col md={1}>
          <strong>{__('Risk Factor')}</strong>
        </Grid.Col>
        <Grid.Col md={8}>
          {getSeverityImg(entry)} {entry.severity}
        </Grid.Col>
      </Grid.Row>
    );
  }
  return <div />;
};

export const getSummary = entry => {
  if (entry.summary) {
    return (
      <Grid.Row className="top-padded">
        <Grid.Col md={1}>
          <strong>{__('Summary')}</strong>
        </Grid.Col>
        <Grid.Col md={8} className="pre-wrap">
          {entry.summary}
        </Grid.Col>
      </Grid.Row>
    );
  }
  return <div />;
};

export const getTags = entry => {
  if (entry.tags) {
    return (
      <Grid.Row className="top-padded">
        <Grid.Col md={1}>
          <strong>{__('Tags')}</strong>
        </Grid.Col>
        <Grid.Col md={8}>{tagInfo(entry.tags)}</Grid.Col>
      </Grid.Row>
    );
  }
  return <div />;
};

export const getExternals = entry => {
  if (entry.detail && entry.detail.external) {
    return entry.detail.external.map(attr => {
      const key = itemIteratorId(entry, attr);
      return (
        <Grid.Row className="top-padded" key={key}>
          <Grid.Col md={1}>
            <strong>{__('Links')}</strong>
          </Grid.Col>
          <Grid.Col md={8}>
            <a href={attr.url}>{attr.title}</a>
          </Grid.Col>
        </Grid.Row>
      );
    });
  }
  return <div />;
};

export const getRemediations = entry => {
  if (entry.detail && entry.detail.remediations) {
    return entry.detail.remediations.map(attr => {
      const key = itemIteratorId(entry, attr);
      if (attr.type === 'hint') {
        return (
          <Grid.Row className="top-padded" key={key}>
            <Grid.Col md={1}>
              <strong>{__('Hint')}</strong>
            </Grid.Col>
            <Grid.Col md={8}>{attr.context}</Grid.Col>
          </Grid.Row>
        );
      }
      if (attr.type === 'command') {
        return (
          <Grid.Row className="top-padded" key={key}>
            <Grid.Col md={1}>
              <strong>{__('Command')}</strong>
            </Grid.Col>
            <Grid.Col md={8}>
              <code>{attr.context.join(' ')}</code>
            </Grid.Col>
          </Grid.Row>
        );
      }

      return <div />;
    });
  }
  return <div />;
};
