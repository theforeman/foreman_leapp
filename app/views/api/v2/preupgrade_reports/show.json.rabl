object @preupgrade_report

extends 'api/v2/preupgrade_reports/base'

child :preupgrade_report_entries do
  extends 'api/v2/preupgrade_report_entries/base'
end
