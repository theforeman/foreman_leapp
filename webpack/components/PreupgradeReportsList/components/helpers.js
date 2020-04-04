import React from 'react';
import { Grid, ListView, Badge, Icon } from 'patternfly-react';
import EmptyInfoItem from './EmptyInfoItem';

export const itemIteratorId = (entry, ...rest) =>
  `${entry.id}-${entry.preupgradeReportId}-${rest.join('-')}`;

export const presentSeverity = severity => {
  switch (severity) {
    case 'low':
      return '#39a5dc';
    case 'medium':
      return '#f0ab00';
    case 'high':
      return '#cc0000';
    default:
      return '#39a5dc';
  }
};

export const tagInfo = tags =>
  tags.map(attr => (
    <Badge key={attr} variant="pill primary">
      {attr}
    </Badge>
  ));

export const hasRemediations = entry => {
  const key = itemIteratorId(entry, `rm${entry.id}`);
  if (entry.detail && entry.detail.remediations) {
    return (
      <ListView.InfoItem key={key}>
        <Icon type="pf" name="warning-triangle-o" /> Has Remediation
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
          <strong>Title</strong>
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
          <strong>Risk Factor</strong>
        </Grid.Col>
        <Grid.Col md={8}>
          <Icon
            type="pf"
            name="resources-full"
            style={{ color: presentSeverity(entry.severity) }}
          />{' '}
          {entry.severity}
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
          <strong>Summary</strong>
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
          <strong>Tags</strong>
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
            <strong>Links</strong>
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
              <strong>Hint</strong>
            </Grid.Col>
            <Grid.Col md={8}>{attr.context}</Grid.Col>
          </Grid.Row>
        );
      }
      if (attr.type === 'command') {
        return (
          <Grid.Row className="top-padded" key={key}>
            <Grid.Col md={1}>
              <strong>Command</strong>
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
