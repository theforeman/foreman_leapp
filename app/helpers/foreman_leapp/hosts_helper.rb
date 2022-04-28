# frozen_string_literal: true

module ForemanLeapp
  module HostsHelper
    def leapp_hosts_multiple_actions
      [{ action: [_('Preupgrade check with Leapp'), new_job_invocation_path(feature: 'leapp_preupgrade'), false],
         priority: 1000 },
       { action: [_('Upgrade with Leapp'), new_job_invocation_path(feature: 'leapp_upgrade'), false], priority: 1000 }]
    end
  end
end
