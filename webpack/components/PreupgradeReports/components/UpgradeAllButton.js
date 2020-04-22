import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'patternfly-react';
import { translate as __ } from 'foremanReact/common/I18n';

import { idsForInvocation } from '../PreupgradeReportsHelpers';

const UpgradeAllButton = ({ preupgradeReports, postUrl, csrfToken }) => {
  const { hostIds } = idsForInvocation(preupgradeReports);

  return (
    <form action={postUrl} method="post">
      <Button type="submit">{__('Run Upgrade')}</Button>
      <input type="hidden" name="authenticity_token" value={csrfToken} />
      <input type="hidden" name="feature" value="leapp_upgrade" />
      {hostIds.map(hostId => (
        <input type="hidden" name="host_ids[]" key={hostId} value={hostId} />
      ))}
    </form>
  );
};

UpgradeAllButton.propTypes = {
  preupgradeReports: PropTypes.array.isRequired,
  postUrl: PropTypes.string.isRequired,
  csrfToken: PropTypes.string.isRequired,
};

export default UpgradeAllButton;
