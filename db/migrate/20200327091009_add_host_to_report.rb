class AddHostToReport < ActiveRecord::Migration[5.2]
  def change
    add_column :preupgrade_report_entries, :host_id, :integer, null: false
    add_index :preupgrade_report_entries, :host_id
  end
end
