class PreupgradeReportEntries < ActiveRecord::Migration[5.2]
  def up
    create_table :preupgrade_report_entries do |t|
      t.integer :preupgrade_report_id, null: false
      t.string :hostname, null: false
      t.string :title, null: false
      t.string :actor, null: false
      t.string :audience, null: false
      t.string :severity, null: false
      t.string :leapp_run_id, null: false
      t.text :summary
      t.text :tags
      t.text :detail

      t.timestamps
    end

    add_index :preupgrade_report_entries, :preupgrade_report_id
  end

  def down
    remove_index :preupgrade_report_entries, :preupgrade_report_id
    drop_table :preupgrade_report_entries
  end
end
