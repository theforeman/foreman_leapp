module Actions
  module ForemanLeapp
    class PreUpgradeAction < Actions::EntryAction
      def self.subscribe
        Actions::RemoteExecution::RunHostJob
      end

      def plan(job_invocation, host, template_invocation, *args)
        rex_feature = RemoteExecutionFeature.find_by(job_template_id: template_invocation.template_id)&.label
        return unless job_invocation.job_category == ::ForemanLeapp::JOB_CATEGORY && rex_feature == 'leapp_preupgrade'

        plan_self(host_id: host.id)
      end

      def finalize(*args)
        host = Host.find(input[:host_id])
        leapp_report = format_output(task.main_action.continuous_output.humanize)

        PreupgradeReport.create_report(host, leapp_report)
      end

      private

      def format_output(job_output)
        output = job_output.each_line(chomp: true)
                     .drop_while { |l| ! l.start_with? '===leap_upgrade_report_start===' }.drop(1)
                     .take_while { |l| ! l.start_with? 'Exit status:' }
                     .reject(&:empty?)
                     .join('')
        JSON.parse(output)
      end
    end
  end
end
