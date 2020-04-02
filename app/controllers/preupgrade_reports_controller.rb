# frozen_string_literal: true

class PreupgradeReportsController < ::Api::V2::BaseController
  def index
    @preupgrade_reports = resource_scope.search_for(*search_options)
  end
end
