# frozen_string_literal: true

module ForemanLeapp
  module RemoteExecutionHelperExtension
    def job_invocation_task_buttons(task)
      return super unless @job_invocation.remote_execution_feature&.label == 'leapp_remediation_plan'

      super.insert(2, link_to(_('Rerun preupgrade check'),
                      new_job_invocation_path(host_ids: @resource_base.map(&:id), feature: 'leapp_preupgrade'),
                      class: 'btn btn-default',
                      title: _('Run Leapp Preupgrade check again'),
                      method: :get))
    end
  end
end
