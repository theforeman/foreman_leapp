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

      api :POST, '/preupgrade_reports/:preupgrade_report_id/preupgrade_report_entries/bulk_remediate',
        N_('Trigger a remediation job for selected preupgrade report entries')
      param :search, String, required: false, desc: N_('Search string')
      param :excluded_ids, Array, required: false, desc: N_('Array of excluded entry IDs')
      def bulk_remediate
        entries = filtered_remediation_entries
        remediation_ids = entries.pluck(:id)

        if remediation_ids.empty?
          return render json: { error: _('No fixable entries found matching the selection.') },
            status: :unprocessable_entity
        end

        composer = JobInvocationComposer.for_feature(
          'leapp_remediation_plan',
          target_host_ids(entries),
          { 'remediation_ids' => remediation_ids.join(',') }
        )
        composer.trigger!
        job_invocation = composer.job_invocation

        render json: { id: job_invocation.id }
      rescue StandardError => e
        Foreman::Logging.exception('Failed to trigger bulk remediation job', e)
        render json: { error: _('An unexpected error occurred while creating the remediation job.') },
          status: :internal_server_error
      end

      protected

      def model_of_controller
        PreupgradeReportEntry
      end

      def resource_scope(_options = {})
        scope = if @preupgrade_report
                  @preupgrade_report.preupgrade_report_entries
                else
                  PreupgradeReportEntry
                end
        scope.joins(:host).merge(Host.authorized(:view_hosts, Host))
      end

      def resource_scope_for_index(options = {})
        order_str = params[:order].to_s
        return super unless order_str.match?(/^(severity|risk_factor)\b/i)
        direction = order_str.match?(/desc$/i) ? 'DESC' : 'ASC'

        resource_scope(options)
          .search_for(params[:search].to_s)
          .order_by_severity(direction)
          .paginate(paginate_options)
      end

      private

      def filtered_remediation_entries
        combined_search = [params[:search].presence, 'fix_type = command'].compact.join(' AND ')
        entries = resource_scope.search_for(combined_search)
        entries = entries.where.not(id: params[:excluded_ids]) if params[:excluded_ids].present?
        entries
      end

      def target_host_ids(entries)
        host_ids = entries.pluck(:host_id).uniq.compact
        host_ids = [@preupgrade_report.host_id].compact if host_ids.empty? && @preupgrade_report
        host_ids
      end

      def find_preupgrade_report
        @preupgrade_report = PreupgradeReport
                             .joins(:host)
                             .merge(Host.authorized(:view_hosts, Host))
                             .find(params[:preupgrade_report_id])
      end

      def path_to_authenticate
        auth_action = case action_name
                      when 'auto_complete_search'
                        'index'
                      when 'bulk_remediate'
                        'create'
                      else
                        action_name
                      end
        path_params = params.slice(:id, :user_id)
                            .merge(action: auth_action, controller: 'api/v2/job_invocations')
        Foreman::AccessControl.normalize_path_hash(path_params)
      end
    end
  end
end
