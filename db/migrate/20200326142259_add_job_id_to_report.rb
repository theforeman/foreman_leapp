class AddJobIdToReport < ActiveRecord::Migration[5.2]
  def change
    add_column :reports, :job_invocation_id, :integer
    add_index  :reports, :job_invocation_id
  end
end
