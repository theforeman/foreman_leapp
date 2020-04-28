# frozen_string_literal: true

module Api
  module V2
    class PreupgradeReportsController < ::Api::V2::BaseController
      api :GET, '/preupgrade_reports/', N_('List Preupgrade reports')
      param_group :search_and_pagination, ::Api::V2::BaseController
      def index
        @preupgrade_reports = resource_scope_for_index
      end

      api :GET, '/job_invocations/:id/preupgrade_report', N_('Show Preupgrade report')
      param :id, :identifier, required: true
      def show
        @preupgrade_report = PreupgradeReport.find_by(job_invocation_id: params[:id])
        deny_access unless @preupgrade_report.host.authorized?(:view_hosts)
      end

      private

      # By overriding path_to_authenticate we can require REX's permission view_job_invocations
      def path_to_authenticate
        Foreman::AccessControl.normalize_path_hash params.slice(:action, :id, :user_id)
                                                         .merge({ controller: 'api/v2/job_invocations' })
      end

      def deny_access
        render_error 'access_denied', status: :forbidden,
                                      locals: { details: _('Missing one of the required permissions: view_hosts'),
                                                missing_permissions: 'view_hosts' }
      end
    end
  end
end
