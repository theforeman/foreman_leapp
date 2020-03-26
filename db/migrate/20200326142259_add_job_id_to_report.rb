class AddJobIdToReport < ActiveRecord::Migration[5.2]
  def up
    add_column :reports, :job_invocation_id, :integer
    add_index  :reports, :job_invocation_id
  end

  def down
    remove_index  :reports, :job_invocation_id
    remove_column :reports, :job_invocation_id, :integer
  end
end
