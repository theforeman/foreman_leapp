class ReportEntriesFlags < ActiveRecord::Migration[6.0]
  def change
    add_column :preupgrade_report_entries, :flags, :string
  end
end
