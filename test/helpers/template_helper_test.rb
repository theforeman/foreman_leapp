# frozen_string_literal: true

require 'test_plugin_helper'

module ForemanLeapp
  class TemplateHelperTest < ActionView::TestCase
    let(:host) { FactoryBot.create(:host) }
    let(:report) { FactoryBot.create(:preupgrade_report, host: host) }
    let(:entry) { FactoryBot.create(:preupgrade_report_entry, host: host, preupgrade_report: report) }

    describe 'build_remediation_plan' do
      test 'with remediation commands' do
        template = build_remediation_plan([entry.id], host)
        assert_equal template, "yum -y remove leapp_pkg\n"
      end

      test 'without remediation commands' do
        empty_entry = FactoryBot.create(:preupgrade_report_entry, host: host, preupgrade_report: report,
                                                                  detail: { remediations: [{ type: 'hint',
                                                                                             context: 'meh.' }] })
        template = build_remediation_plan([empty_entry.id], host)
        assert_equal template, ''
      end

      test 'only for current host' do
        template = build_remediation_plan([entry.id], FactoryBot.create(:host))
        assert_equal template, ''
      end
    end
  end
end
