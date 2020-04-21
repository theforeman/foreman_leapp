# frozen_string_literal: true

class PreupgradeReportsController < ::Api::V2::BaseController
  def index
    @preupgrade_reports = PreupgradeReport.search_for(*search_options)
  end

  private

  # By overriding :path_to_authenticate we can require REX's :view_job_invocations permission
  def path_to_authenticate
    Foreman::AccessControl.normalize_path_hash params.slice(:action, :id, :user_id)
                                                     .merge({ controller: 'job_invocations' })
  end
end
