# frozen_string_literal: true

module Api
  module V2
    class PreupgradeReportEntriesController < ::Api::V2::BaseController
      include ApiAuthorizer
      include Foreman::Controller::AutoCompleteSearch

      skip_before_action :store_redirect_to_url, :reset_redirect_to_url, raise: false
      before_action :find_preupgrade_report, if: -> { params[:preupgrade_report_id].present? }

      api :GET, '/preupgrade_reports/:preupgrade_report_id/preupgrade_report_entries',
        N_('List entries for a specific preupgrade report')
      api :GET, '/preupgrade_report_entries', N_('List all preupgrade report entries')
      param :preupgrade_report_id, :identifier, required: false,
        desc: N_('ID of the preupgrade report')
      param_group :search_and_pagination, ::Api::V2::BaseController
      def index
        @total = resource_scope.count
        @preupgrade_report_entries = resource_scope_for_index
        @subtotal = @preupgrade_report_entries.total_entries
      end

      api :GET, '/preupgrade_report_entries/auto_complete_search',
        N_('Search autocomplete for preupgrade report entries')
      param :search, String, required: false, desc: N_('Search string')
      param :preupgrade_report_id, :identifier, required: false, desc: N_('ID of the preupgrade report')

      protected

      def model_of_controller
        resource_scope
      end

      def resource_scope(_options = {})
        scope = if @preupgrade_report
                  @preupgrade_report.preupgrade_report_entries
                else
                  PreupgradeReportEntry
                end
        scope.joins(:host).merge(Host.authorized(:view_hosts, Host))
      end

      private

      def find_preupgrade_report
        @preupgrade_report = PreupgradeReport
                             .joins(:host)
                             .merge(Host.authorized(:view_hosts, Host))
                             .find(params[:preupgrade_report_id])
      end

      def path_to_authenticate
        auth_action = (action_name == 'auto_complete_search') ? 'index' : action_name
        path_params = params.slice(:id, :user_id)
                            .merge(action: auth_action, controller: 'api/v2/job_invocations')
        Foreman::AccessControl.normalize_path_hash(path_params)
      end
    end
  end
end
