# frozen_string_literal: true

module ApiAuthorizer
  extend ActiveSupport::Concern

  included do
    before_action :hosts_permission
  end

  private

  def hosts_permission
    return if User.current.can?('view_hosts')

    render_error 'access_denied', status: :forbidden,
                                  locals: { details: _('Missing one of the required permissions: view_hosts'),
                                            missing_permissions: 'view_hosts' }
  end

  def resource_scope(_options = {})
    @resource_scope ||= begin
      scope = PreupgradeReport.joins(:host).merge(Host.authorized(:view_hosts, Host))
      scope = scope.where(job_invocation_id: params[:id]) if action_name == 'job_invocation'
      scope
    end
  end
end
