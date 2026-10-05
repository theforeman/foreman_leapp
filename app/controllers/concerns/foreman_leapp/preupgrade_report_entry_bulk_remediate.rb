# frozen_string_literal: true

module ForemanLeapp
  module PreupgradeReportEntryBulkRemediate
    extend ActiveSupport::Concern

    def perform_bulk_remediate
      entries = filtered_remediation_entries
      remediation_ids = entries.pluck(:id)

      if remediation_ids.empty?
        render json: { error: _('No fixable entries found matching the selection.') },
          status: :unprocessable_entity
        return
      end

      composer = JobInvocationComposer.for_feature(
        'leapp_remediation_plan',
        target_host_ids(entries),
        { 'remediation_ids' => remediation_ids.join(',') }
      )
      composer.trigger!
      composer.job_invocation.id
    end

    private

    def filtered_remediation_entries
      fixable_remediation_scope(scope_for_bulk_selection)
    end

    def scope_for_bulk_selection
      return resource_scope.where(id: params[:ids]) if params[:ids].present?

      unless scoped_to_report_or_job?
        raise Foreman::Exception,
          N_('Either ids, preupgrade_report_id or job_invocation_id must be provided')
      end

      apply_excluded_ids(search_fixable_entries)
    end

    def scoped_to_report_or_job?
      @preupgrade_report.present? || params[:job_invocation_id].present?
    end

    def search_fixable_entries
      combined_search = [params[:search].presence, 'fix_type = command'].compact.join(' AND ')
      resource_scope.search_for(combined_search)
    end

    def apply_excluded_ids(entries)
      return entries.where.not(id: params[:excluded_ids]) if params[:excluded_ids].present?

      entries
    end

    def fixable_remediation_scope(scope)
      scope.search_for('fix_type = command')
    end

    def target_host_ids(entries)
      host_ids = entries.pluck(:host_id).uniq.compact
      return [@preupgrade_report.host_id].compact if host_ids.empty? && @preupgrade_report

      host_ids
    end
  end
end
