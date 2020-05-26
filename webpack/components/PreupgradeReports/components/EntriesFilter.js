import React from 'react';
import { DebounceInput } from 'react-debounce-input';
import { DropdownButton, MenuItem, Form, Col, Row } from 'patternfly-react';
import PropTypes from 'prop-types';

import { translate as __ } from 'foremanReact/common/I18n';

import './EntriesFilter.scss';

const EntriesFilter = ({
  filterType,
  filterValue,
  onFilterValueChange,
  onFilterTypeChange,
}) => {
  let filterValueField;

  const filterTypes = [
    { value: 'title', label: __('Title') },
    { value: 'severity', label: __('Risk Factor') },
    { value: 'hostname', label: __('Host') },
    { value: 'fix', label: __('Fix Type') },
    { value: 'inhibitor', label: __('Inhibitor') },
  ];

  const severityTypes = [
    { value: '', label: __('All') },
    { value: 'low', label: __('Low') },
    { value: 'medium', label: __('Medium') },
    { value: 'high', label: __('High') },
    { value: 'info', label: __('Info') },
  ];

  const fixTypes = [
    { value: '', label: __('All') },
    { value: 'hint', label: __('Hint') },
    { value: 'command', label: __('Command') },
  ];

  const inhibitorTypes = [
    { value: '', label: __('All') },
    { value: 'yes', label: __('Yes') },
    { value: 'no', label: __('No') },
  ];

  const selectOptionMapping = {
    severity: severityTypes,
    fix: fixTypes,
    inhibitor: inhibitorTypes,
  };

  const findLabel = (selectOptions, currentValue) =>
    selectOptions.find(opt => opt.value === currentValue).label;

  if (['title', 'hostname'].includes(filterType)) {
    filterValueField = (
      <DebounceInput
        className="form-control entries-filter-reset-height"
        debounceTimeout={300}
        onChange={event => onFilterValueChange(event.target.value)}
      />
    );
  }

  if (['severity', 'fix', 'inhibitor'].includes(filterType)) {
    const options = selectOptionMapping[filterType];

    filterValueField = (
      <DropdownButton
        id="entry-value-filter"
        title={findLabel(options, filterValue)}
      >
        {options.map(type => (
          <MenuItem
            key={type.value}
            active={filterValue === type.value}
            onClick={() => onFilterValueChange(type.value)}
          >
            {type.label}
          </MenuItem>
        ))}
      </DropdownButton>
    );
  }

  return (
    <Row>
      <Col md={4}>
        <Form.FormGroup>
          <Form.InputGroup>
            <DropdownButton
              id="entry-filter"
              title={findLabel(filterTypes, filterType)}
              componentClass={Form.InputGroup.Button}
            >
              {filterTypes.map(type => (
                <MenuItem
                  key={type.value}
                  active={filterType === type.value}
                  onClick={() => onFilterTypeChange(type.value)}
                >
                  {type.label}
                </MenuItem>
              ))}
            </DropdownButton>
            {filterValueField}
          </Form.InputGroup>
        </Form.FormGroup>
      </Col>
    </Row>
  );
};

EntriesFilter.propTypes = {
  filterType: PropTypes.string.isRequired,
  filterValue: PropTypes.string.isRequired,
  onFilterTypeChange: PropTypes.func.isRequired,
  onFilterValueChange: PropTypes.func.isRequired,
};

export default EntriesFilter;
