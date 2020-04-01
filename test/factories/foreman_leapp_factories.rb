# frozen_string_literal: true

FactoryBot.define do
  factory :preupgrade_report do
    host
    reported_at { Time.now.utc }
    type { 'PreupgradeReport' }
    status { '0' }
  end

  factory :preupgrade_report_entry do
    host
    preupgrade_report
    sequence(:title) { |n| "Leap report entry title #{n}" }
    sequence(:actor) { |n| "leapp_actor#{n}" }
    hostname { host.name }
    audience { 'sys_admin' }
    severity { 'medium' }
    leapp_run_id { SecureRandom.hex(8) }
    tags { %w[tag1 tag2] }
    summary { '' }
    detail do
      { remediations: [{ type: 'hint', context: 'meh.' },
                       { type: 'command', context: ['yum', '-y', 'remove', 'leapp_pkg'] }] }
    end
  end
end
