# frozen_string_literal: true

module Actions
  module ForemanLeapp
    class PreupgradeJob < Actions::EntryAction
      def self.subscribe
        Actions::RemoteExecution::RunHostJob
      end

      def plan(job_invocation, host, *_args)
        return unless ::Helpers::JobHelper.correct_feature?(job_invocation, 'leapp_preupgrade')

        plan_self(host_id: host.id, job_invocation_id: job_invocation.id)
      end

      def finalize(*_args)
        host = Host.find(input[:host_id])
        leapp_report = format_output(task.main_action.continuous_output.humanize)

        PreupgradeReport.create_report(host, leapp_report, input[:job_invocation_id])
      end

      private

      def format_output(job_output)
        output = job_output.each_line(chomp: true)
                           .drop_while { |l| !l.start_with? '===leap_upgrade_report_start===' }.drop(1)
                           .take_while { |l| !l.start_with? 'Exit status:' }
                           .reject(&:empty?)
                           .join('')
        JSON.parse(output)
      end
    end
  end
end
