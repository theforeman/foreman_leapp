# frozen_string_literal: true

module Api
  module V2
    class PreupgradeReportsController < ::Api::V2::BaseController
      include Utils

      before_action :resolve_host, only: %i[show_last_report]
      before_action :find_resource, only: %i[show]

      api :GET, '/preupgrade_reports/', N_('List Preupgrade reports')
      param_group :search_and_pagination, ::Api::V2::BaseController
      def index
        @preupgrade_reports = resource_scope_for_index
      end

      api :GET, '/preupgrade_reports/:id', N_('Show Preupgrade report')
      param :id, :identifier, required: true
      def show
      end

      # TODO: Do we need it?
      def show_last_report
        if @host.nil?
          render :json => { "error": format("Couldn't find host %<host>s", host: params['host']) }
        else
          render :json => last_report(@host)
        end
      end

      private

      def resolve_host
        host_name_or_id = params['host']
        @host = Host.where(:name => host_name_or_id).or(Host.where(:id => host_name_or_id)).first
      end
    end
  end
end
