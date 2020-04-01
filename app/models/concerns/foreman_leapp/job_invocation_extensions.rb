# frozen_string_literal: true

module ForemanLeapp
  module JobInvocationExtensions
    extend ActiveSupport::Concern

    included do
      has_many :preupgrade_reports, dependent: :destroy
    end
  end
end
