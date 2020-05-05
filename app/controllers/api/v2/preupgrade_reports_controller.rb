# frozen_string_literal: true

module Api
  module V2
    class PreupgradeReportsController < ::Api::V2::BaseController
      include ApiAuthorizer

      api :GET, '/preupgrade_reports/', N_('List Preupgrade reports')
      param_group :search_and_pagination, ::Api::V2::BaseController
      def index
        @preupgrade_reports = PreupgradeReport.search_for(*search_options)
                                              .joins(:host)
                                              .merge(Host.authorized(:view_hosts, Host))
                                              .paginate(paginate_options)
      end

      api :GET, '/preupgrade_reports/:id', N_('Show Preupgrade report')
      param :id, :identifier, required: true
      def show
        @preupgrade_report = PreupgradeReport.joins(:host)
                                             .merge(Host.authorized(:view_hosts, Host))
                                             .find(params[:id])
      end

      api :GET, '/job_invocations/:id/preupgrade_reports', N_('List Preupgrade reports for Job invocation')
      param :id, :identifier, required: true
      def job_invocation
        @preupgrade_reports = PreupgradeReport.where(job_invocation_id: params[:id])
                                              .joins(:host)
                                              .merge(Host.authorized(:view_hosts, Host))
      end

      private

      # By overriding path_to_authenticate we can require REX's permission view_job_invocations
      def path_to_authenticate
        params['action'] = 'show' if params['action'] == 'job_invocation'
        Foreman::AccessControl.normalize_path_hash params.slice(:action, :id, :user_id)
                                                         .merge({ controller: 'api/v2/job_invocations' })
      end
    end
  end
end
