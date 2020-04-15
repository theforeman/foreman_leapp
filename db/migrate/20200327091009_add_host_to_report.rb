class AddHostToReport < ActiveRecord::Migration[5.2]
  def up
    add_column :preupgrade_report_entries, :host_id, :integer
    change_column :preupgrade_report_entries, :host_id, :integer, null: false
    add_index :preupgrade_report_entries, :host_id
  end

  def down
    remove_index :preupgrade_report_entries, :host_id
    remove_column :preupgrade_report_entries, :host_id
  end
end
