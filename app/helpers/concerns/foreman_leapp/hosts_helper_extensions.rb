# frozen_string_literal: true

module ForemanLeapp
  module HostsHelperExtensions
    def multiple_actions
      super + [[_('Preupgrade check with Leapp'), new_job_invocation_path(feature: 'leapp_preupgrade'), false],
               [_('Upgrade with Leapp'), new_job_invocation_path(feature: 'leapp_upgrade'), false]]
    end

    def rex_host_features(*args)
      super + [link_to(_('Preupgrade check with Leapp'),
                       new_job_invocation_path(host_ids: [args.first.id], feature: 'leapp_preupgrade')),
               link_to(_('Upgrade with Leapp'),
                       new_job_invocation_path(host_ids: [args.first.id], feature: 'leapp_upgrade'))]
    end
  end
end
